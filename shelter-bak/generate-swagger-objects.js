const fs = require('fs');
const YAML = require('yaml');
const { resolve } = require('path');
const parsedSwagger = YAML.parse(fs.readFileSync(resolve(__dirname,'./src/swagger.yaml')).toString());

const knownObjects = [];
const swaggerDefinitions = {};
function generate(swagger, outputFileName) {
    if (swagger) {
        const file = fs.openSync(outputFileName, 'w');
        swaggerDefinitions.definitions = swagger.definitions;
        if (swagger.definitions) {
            for (const [name, value] of Object.entries(swagger.definitions)) {
                if (!knownObjects.find( v => v.name === name)) {
                    knownObjects.push({name, obj: parseSchema(value)});
                }
            }
        }
        for (const o of knownObjects) {
            const obj = writeObj(o.obj, 4);
            fs.writeSync(file, `export const ${o.name} = ${obj};\n`);
        }
        fs.closeSync(file);
    }
}
function padLeft(pad) {
    let res = '';
    for (let i = 0; i < pad; ++i) {
        res += ' ';
    }
    return res;
}
function writeObj(obj, pad) {
    return 'new SwaggerObject(\n'+
        `${padLeft(pad)}${writeAsStr(obj.orderCtrl)},\n`+
        `${writeProperties(obj.properties, pad)},\n`+
        `${writeUI(obj.ui, pad)},\n`+
        `${padLeft(pad)}${writeAsStr(obj.required)})`;
}
function writeAsStr(obj) {
    if (obj !== undefined && obj !== null) {
        if (typeof obj === 'string') {
            return `'${obj.replace('\'','\\\'')}'`;
        } else if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                let res = '[';
                for (const o of obj) {
                    res += ' ' + writeAsStr(o) + ',';
                }
                return res + ']';
            }
            let res = '';
            Object.keys(obj).forEach( v => {
                res += ` ${v}: `+ writeAsStr(obj[v]) + ',';
            });
            return `{${res}}`;
        }
    }
    return 'null';
}
function writeProperty(value, pad) {
    switch (value.type) {
    case 'string':
        return 'new SwaggerNativeString(\n'+
            `${padLeft(pad)}${value.controlType},\n`+
            `${padLeft(pad)}${writeAsStr(value.constraints)},\n`+
            `${writeUI(value.ui, pad)})`;
    case 'number':
        return 'new SwaggerNativeNumber(\n'+
            `${padLeft(pad)}${value.controlType},\n`+
            `${padLeft(pad)}${writeAsStr(value.constraints)},\n`+
            `${writeUI(value.ui, pad)})`;
    case 'integer':
        return 'new SwaggerNativeInteger(\n'+
            `${padLeft(pad)}${value.controlType},\n`+
            `${padLeft(pad)}${writeAsStr(value.constraints)},\n`+
            `${writeUI(value.ui, pad)})`;
    case 'boolean':
        return 'new SwaggerNativeBoolean(\n'+
            `${padLeft(pad)}${value.controlType},\n`+
            `${padLeft(pad)}${writeAsStr(value.constraints)},\n`+
            `${writeUI(value.ui, pad)})`;
    }
}
function writeProperties(properties, pad) {
    let res = '';
    for (const name in properties) {
        let property;
        const value = properties[name];
        switch (value.type) {
        case 'object':
            property = writeObj(value, pad + 4);
            break;
        case 'array':
            property = writeArray(value, pad + 4);
            break;
        default:
            property = writeProperty(value, pad + 4);
        }
        res += `${padLeft(pad)}${name}: ${property},\n`;
    }
    if (res.length > 0) {
        return `${padLeft(pad)}{\n${res}\n${padLeft(pad)}}`;
    }
    return `${padLeft(pad)}{}`;
}
function writeUI(value, pad) {
    if (value.caption || value.description) {
        return `${padLeft(pad)}swaggerUI(${writeAsStr(value.caption)},${writeAsStr(value.description)})`;
    }
    return `${padLeft(pad)}swaggerUI()`;
}
function writeArray(value, pad) {
    let items;
    if (value.items.type === 'ref') {
        items = value.ref;
    } else if (value.items.type === 'object') {
        items = writeObj(value.items, pad + 4);
    } else {
        items = writeProperty(value.items, pad + 4);
    }
    return 'new SwaggerArray(\n'+
    `${padLeft(pad)}${items},\n`+
    `${padLeft(pad)}${writeAsStr(value.constraints)},\n`+
    `${padLeft(pad)}${writeUI(value.ui)})`;
}
function getReference(ref) {
    const path = ref.split('/');
    const name = path[path.length - 1];
    if (knownObjects.find( v => v.name === name)) {
        return {type: 'ref', ref: name};
    }
    if (swaggerDefinitions.definitions[name]) {
        knownObjects.push({name, obj: parseObject(swaggerDefinitions.definitions[name])});
        return {type: 'ref', ref: name};
    }
    throw new Error('Do not found reference: '+ ref);
}
function parseSchema(obj) {
    if (!obj.type) { // I sometimes forget to add type in swagger :(
        if (obj.properties) {
            obj.type = 'object';
        }
    }
    if (obj.$ref) {
        return getReference(obj.$ref);
    }
    switch (obj.type) {
    case 'object':
        return parseObject(obj);
    case 'array':
        return parseArray(obj);
    default:
        return parseProperty(obj);
    }
}
/**
 * convert body of swagger object to "SwaggerObject"
 * @param obj
 */
function parseObject(obj) {
    const properties = {};
    const required = obj.required;
    const orderCtrl = []; // we don't control them
    const ui = parseUI(obj);
    if (obj.properties) {
        Object.keys(obj.properties).forEach(key => {
            properties[key] = parseSchema(obj.properties[key]);
            orderCtrl.push(key);
        });
    }
    return {type: 'object', orderCtrl, properties, ui, required};
}

function parseProperty(obj) {
    const type = obj.type;
    const controlType = obj['x-ui-control'];
    const constraints = parseConstraints(obj);
    const ui = parseUI(obj);
    return {type, controlType, constraints, ui};
}
function parseArray(obj) {
    const items = parseSchema(obj.items);
    const constraints = parseConstraints(obj);
    const ui = parseUI(obj);
    return {type: 'array', items, constraints, ui};
}

function parseUI(obj) {
    const res = {};
    if (obj.title) {
        res.title = [{lang:'en', title: obj.title}];
    }
    if (obj.description) {
        res.description = [{lang:'en', title: obj.description}];
    }
    return res;
}
function copyIfPresent(dest, src, name) {
    if (dest[name] !== undefined) {
        src[name] = dest[name];
    }
}
function parseConstraints(obj) {
    const res = {};
    copyIfPresent(obj, res,'readOnly');
    copyIfPresent(obj, res,'writeOnly');
    copyIfPresent(obj, res,'nullable');
    copyIfPresent(obj, res,'enum');
    copyIfPresent(obj, res,'enumMulti');
    copyIfPresent(obj, res,'default');
    copyIfPresent(obj, res,'format');
    const type = obj.type;
    switch (type) {
    case 'string':
        copyIfPresent(obj, res,'minLength');
        copyIfPresent(obj, res,'maxLength');
        copyIfPresent(obj, res,'pattern');
        break;
    case 'integer':
    case 'number':
        copyIfPresent(obj, res,'minimum');
        copyIfPresent(obj, res,'maximum');
        copyIfPresent(obj, res,'exclusiveMinimum');
        copyIfPresent(obj, res,'exclusiveMaximum');
        copyIfPresent(obj, res,'multipleOf');
        break;
    case 'array':
        copyIfPresent(obj, res,'minItems');
        copyIfPresent(obj, res,'maxItems');
        copyIfPresent(obj, res,'uniqueItems');
        break;
    }
    return res;
}
generate(parsedSwagger, 'swagger-objects.ts');
