const log = require('../../log.js')('Storage.LargeObjects.S3Storage');
const AWS = require('aws-sdk');
const {Writable} = require('stream');
const uuid = require('uuid-random');

/**
 * initialize multipart upload
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createMultipartUpload-property
 * @param s3storage
 *   - bucketName
 *   - key
 * @return {Promise<data>}
 */
function createMultipartUpload(s3storage) {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    return new Promise((resolve, reject)=>{
        s3.createMultipartUpload({Bucket, Key},(err,data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * upload part
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#uploadPart-property
 * @param s3storage
 *   - bucketName
 *   - key
 * @param partNumber
 * @param buffer
 *
 * @return {Promise<ETag>}
 */
function uploadPart(s3storage, partNumber, buffer) {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    let PartNumber = partNumber;
    let UploadId;
    let Body = buffer;
    return new Promise((resolve, reject)=>{
        s3.uploadPart({Bucket, Key, Body, PartNumber, UploadId},(err,data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data.ETag);
            }
        });
    });
}

/**
 * cancel uploads
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#abortMultipartUpload-property
 * @param s3storage
 *   - bucketName
 *   - key
 *   - uploadId
 * Possible values include:
 * "requester"
 * @return {Promise<data>}
 */
function abortMultipartUpload(s3storage) {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    let UploadId = s3storage.uploadId;
    return new Promise((resolve, reject)=>{
        s3.abortMultipartUpload({Bucket, Key, UploadId},(err, data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * complete uploads
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#completeMultipartUpload-property
 * @param s3storage
 *  - bucketName
 *  - key
 *  - uploadId
 *  - parts
 * @return {Promise<data>}
 */
function completeMultipartUpload(s3storage) {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    let UploadId = s3storage.uploadId;
    let MultipartUpload = {Parts:s3storage.parts};
    return new Promise((resolve, reject)=>{
        s3.completeMultipartUpload({Bucket, Key, MultipartUpload, UploadId},(err,data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * pull object from bucket
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
 * @param s3storage
 *   - bucketName
 *   - key
 * @return {Promise<data>}
 */
function getObject(s3storage) {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    return new Promise((resolve, reject)=>{
        s3.getObject({Bucket, Key},(err,data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * delete object
 *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
 * @param s3storage
 *   - bucketName
 *   - key
 * @return {Promise<unknown>}
 */
function deleteObject(s3storage) { //TODO what is null version?
    let s3 = new AWS.S3({apiVersion: '2006-03-01'}); //TODO
    let Bucket = s3storage.bucketName;
    let Key = s3storage.key;
    return new Promise((resolve, reject)=>{
        s3.deleteObject({Bucket, Key},(err,data)=>{
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

class S3Storage extends Writable {
    constructor(options) {
        super(options);
        this.s3 = new AWS.S3({apiVersion: '2006-03-01'});
        this.bucketName = options.bucketName;
        this.partNumber = 0;
        this.parts = [];
        this
            .on('finish',()=>{
                completeMultipartUpload(this);//TODO
            })
            .on('error', (err)=>{
                abortMultipartUpload(this);//TODO
                log.err(err);//TODO
            });
    }
    _write(chunk, encoding, callback) {
        let buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, encoding);
        let partNumber = ++this.partNumber;
        uploadPart(this, this.partNumber, buffer)
            .then((eTag)=>{
                this.parts[partNumber] = eTag;
                callback();
            })
            .catch((err)=>callback(err));
    }
    _calcKey(id){
        this.id = id || uuid();
        this.key = '/los/' + this.id;
        return this.key;
    }
    /**
     * initialize write object operations
     * return: {id, stream, result}
     * id - id of object
     * stream - writable stream
     * result - promise that indicates of end of operation
     */
    async write() {
        this._calcKey();
        let data = await createMultipartUpload(this);
        this.uploadId = data.UploadId;
        const result = new Promise((resolve,reject)=>{
            this.on('finish', resolve)
                .om('error', reject);
        });
        return {id: this.id, stream: this, result};
    }
    /**
     * initialize read object operations
     * parameter: id of object
     * return: {id, stream, result}
     * id - id of object
     * stream - readable stream
     * result - promise that indicates of end of operation
     */
    async read(id){
        this._calcKey(id);
        let data = await getObject(this);
        return {id: this.id, stream: data.Body, result: Promise.resolve()}; //TODO
    }
    /**
     * delete object
     * return promise
     */
    async delete(id){
        this._calcKey(id);
        return deleteObject(this);
    }
}
module.exports = S3Storage;
