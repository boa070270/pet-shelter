# Forms
To describe a dynamic form was selected Swagger 2.0 notation (as base)

##Data types:
[Swagger 2.0 Data Types](https://swagger.io/docs/specification/data-models/data-types/)
<ul>There are supported all types (except mixing type)
<li> string (this includes dates and files)</li>
<li> number</li>
<li> integer</li>
<li> boolean</li>
<li> array</li>
<li> object</li>
</ul>

Form can be build by:
<ul>In runtime:
<li>providing our internal format in JSON</li>
<li>providing Swagger file: JSON or YAML? (I'm not sure I will do this)</li>
</ul>
<ul>On building:
<li>generating internal objects</li>
</ul>

###Internal format
This format is similar to Swagger JSON. All interfaces are described here [swagger-object.tx](src/lib/swagger-form/swagger-object.ts)
Example: [from Swagger Editor](https://editor.swagger.io/)
<pre>
{
  "Order": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "format": "int64"
      },
      "petId": {
        "type": "integer",
        "format": "int64"
      },
      "quantity": {
        "type": "integer",
        "format": "int32"
      },
      "shipDate": {
        "type": "string",
        "format": "date-time"
      },
      "status": {
        "type": "string",
        "description": "Order Status",
        "enum": [
          "placed",
          "approved",
          "delivered"
        ]
      },
      "complete": {
        "type": "boolean",
        "default": false
      }
    }
  }
}
</pre>
will look like:
<pre>
{
  "Order": {
    "properties": {
      "id": {
        "type": "integer",
      },
      "petId": {
        "type": "integer",
      },
      "quantity": {
        "type": "integer",
      },
      "shipDate": {
        "type": "string",
        "constrictions": {
          "format": "date-time"
        }
      },
      "status": {
        "type": "string",
        "ui": {
          "description": "Order Status",
        },
        "constrictions": {
          "enum": [
            "placed",
            "approved",
            "delivered"
          ]
        }
      },
      "complete": {
        "type": "boolean",
        "constrictions": {
          "default": false
        }
      }
    }
  }
}
</pre>
This object will look at HTML page like (very simplified):
<pre>
  <div>
    <h1>Order</h1>
    <label>
      id
      <input name="id" type="number">
    </label>
    <label>
      petId
      <input name="petId" type="number">
    </label>
    ...
    <label>
      shipDate
      <input name="shipDate" type="datetime-local">
    </label>
    <label>
      status
      <select name="status">
        <option>placed</option>
        <option>approved</option>
        <option>delivered</option>
      </select>
      Order Status
    </label>
    <label>
      complete
      <input name="complete" type="checkbox">
    </label>
  </div>
</pre>

An internal format allows you to add titles, hints, placeholders in different languages.

###How it works:
- user move to page that contain a component that can represent form
- page obtains our internal format of the form's presentation
- page generates HTML and expose it to the user
