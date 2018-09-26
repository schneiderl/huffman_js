const fs = require('fs')

const Huffman = require('./Huffman/Huffman')
const BWT = require('./BWT/bwt')
const MTF = require('./MTF/mtf')

fs.readFile('./resources/alice29.txt', 'utf-8', (err, aliceText) => {
    if (err) {
        console.log(err)
        return
    }

    const pipeline1 = ['BWT', 'MTF', 'Huffman']
    const pipeline2 = ['Huffman']

    const data1 = compress(pipeline1, aliceText)
    const data2 = compress(pipeline2, aliceText)

    let betterCompressed
    let decompressed

    if (data1.encoded.length < data2.encoded.length) {
        console.log('using: ', pipeline1)
        betterCompressed = data1.encoded
        decompressed = decompress(data1)
    } else {
        console.log('using: ', pipeline2)
        betterCompressed = data2.encoded
        decompressed = decompress(data2)
    }

    fs.writeFile('./resources/alice29_compressed.txt', betterCompressed, (err) => {
        if (!err) {
            console.log("alice29_compressed created")
        } else {
            console.log(err)
        }

        fs.writeFile('./resources/alice29_decompressed.txt', decompressed, (err) => {
            if (!err) {
                console.log("alice29_decompressed created")
            } else {
                console.log(err)
            }
        })
    })
})


function decompress({ huffmanTree, bwtTop, encoded, pipeline }) {
    let decoded = encoded

    console.log('decompress: ', pipeline)
    for (let i = 0; i < pipeline.length; i ++) {
        switch (pipeline[i]) {
            case 'BWT':
                console.log('pre bwt: ', decoded)
                decoded = BWT.decode(bwtTop, decoded)
                console.log('pos bwt: ', decoded)
                break
    
            case 'MTF':
                decoded = MTF.decode(decoded.split(','))
                break
    
            case 'Huffman':
                decoded = huffmanTree.decode(decoded)
                break
        }
    }

    return decoded

}

function compress(pipeline, data) {
    let encoded = data
    let bwtTop = null
    let huffmanTree = null

    for (let i = 0; i < pipeline.length; i ++) {
        switch (pipeline[i]) {
            case 'BWT':
                let bwtEncode = BWT.encode(encoded)
                encoded =  bwtEncode.data
                bwtTop = bwtEncode.top
                break
    
            case 'MTF':
                encoded = MTF.encode(encoded).toString()
                break
    
            case 'Huffman':
                huffmanTree = new Huffman(encoded)
                encoded = huffmanTree.encode(encoded)
                break
        }
    }

    return {
        huffmanTree,
        bwtTop,
        encoded,
        pipeline: pipeline.slice(0).reverse()
    } 
}
