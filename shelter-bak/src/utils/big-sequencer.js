const NODE_LENGTH = 4; //number of words that are modified by node
const CLUSTER_LENGTH = 2; //number of words that are modified by cluster
const MAX_UINT16 = 0xffff;
const ENCODING = '0123456789@ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

/**
 * Sequence generator
 * next() increment by 1 and return string with length - 16 char
 * nextCluster - can be used to call concurrent generator like DB or select DB 'update generator set next = next+1 returning next'
 */
class BigSequencer {
    constructor(nextCluster) {
        if(typeof nextCluster === 'function') {
            this.nextCluster = nextCluster;
        }
        this.bufferBase = [];
        for(let i = 0; i < NODE_LENGTH; i++) {
            this.bufferBase.push(0);
        }
    }
    async next() {
        if( this.bufferBase[NODE_LENGTH] === undefined) {
            let num = await this.nextCluster();
            // we expect number uint16 or uint32
            for(let i = 0; i < CLUSTER_LENGTH; ++i) {
                this.bufferBase[NODE_LENGTH+i] = num & MAX_UINT16;
                num = num >> 16;
            }
        }
        for(let pos = 0; pos < NODE_LENGTH; ++pos) {
            let num = this.bufferBase[pos];
            num += 1;
            if(num > MAX_UINT16) {
                this.bufferBase[pos] = 0;
                if(pos >= NODE_LENGTH) {
                    num = await this.nextCluster();
                    // we expect number uint16 or uint32
                    for(let i = 0; i < CLUSTER_LENGTH; ++i) {
                        this.bufferBase[NODE_LENGTH+i] = num & MAX_UINT16;
                        num = num >> 16;
                    }
                    break;
                }
            } else {
                this.bufferBase[pos]= num;
                break;
            }
        }
        return this.toString();
    }
    toString(){
        let result = [];
        let rest = 0;
        let restBits = 0;
        for(const w of this.bufferBase) {
            rest += w << restBits;
            restBits += 16;
            for(; restBits >= 6; restBits -= 6) {
                const num = rest & 0x3f;
                result.unshift(ENCODING[num]);
                rest = rest >> 6;
            }
        }
        if(restBits > 0) {
            result.unshift(ENCODING[rest]);
        }
        return result.join('');
    }
    async nextCluster() {
        // we need to take this from DB or other concurrent cluster resource
        return 0;
    }
}
module.exports = BigSequencer;
