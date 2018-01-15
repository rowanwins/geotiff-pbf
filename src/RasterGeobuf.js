const parseRaster = require('georaster')
const fs = require('fs')
const Pbf = require('pbf')

import { fields, getFieldAndMethod } from './Fields'

export class RasterGeobuf {

  constructor () {
    this.meta = {}
    this.pbf = null
    fields.forEach(f => {this.meta[f.name] = null})
  }

  loadGeoTiff (filepath) {
    if (typeof filepath === 'undefined') filepath = "./test/harness/Sample.tif"
    this.pbf = new Pbf()

    var data = fs.readFileSync(filepath)
    
    return new Promise((resolve, reject) => {
      parseRaster(data).then(tiff => {
        // Write in the metadata
        fields.forEach(mf => {
          if (mf.name !== 'data') {
            this.writeData(mf.type, mf.id, tiff[mf.name])
            this.meta[mf.name] = tiff[mf.name]
          } 
        })


        tiff.values.forEach((layer, index) => {
          this.pbf.writeMessage(14, this.writeMsgData.bind(this), layer)
        })
        resolve(this)
      })
    })
  }

  writeData(type, name, data) {
    if (type === 'Fixed32') return this.pbf.writeFixed32Field(name, data)
    if (type === 'PackedSFixed32') return this.pbf.writePackedSFixed32(name, data)
    if (type === 'Float') return this.pbf.writeFloatField(name, data)
  }

  writeMsgData(obj, pbf) {
    this.pbf.writeStringField(1, 'Layer')
    // For each row in the layer write it to a new message
    obj.forEach((row, index) => {
      this.pbf.writeMessage(index + 2, this.writeRowData.bind(this), row)
    })
  }

  writeRowData(obj, pbf) {
    let count = 1
    var numRecords = 0
    var prevVal = obj[0]
    for (var i = 1; i < obj.length - 1; i++) {
      var thisVal = obj[i]
      // var prevVal = obj[i - 1]
      if (thisVal === prevVal) {
        count++
      } else {
        pbf.writePackedFloat(numRecords, [prevVal, count])
        count = 1
        numRecords++ 
      } 
      prevVal = thisVal
    }
    // If the last two records are the same
    if ([obj][obj.length - 1] === [obj][obj.length - 2]) {
      pbf.writePackedFloat(numRecords, [obj[obj.length - 1], count + 1])
    } else {
      pbf.writePackedFloat(numRecords, [prevVal, count]) 
      pbf.writePackedFloat(numRecords + 1, [obj[obj.length - 1], 1]) 
    }
  }

  savePBF(outname) {
    if (typeof outname === 'undefined') outname = 'georaster.pbf'
    var buffer = this.pbf.finish();
    return new Promise((resolve, reject) => {
      fs.writeFile(outname, buffer, 'utf8', (err) => {
        if (err) throw err;
        resolve(this)
      })
    })
  }

  readPBF(filename) {
    var data = fs.readFileSync(filename)
    this.pbf = new Pbf(new Uint8Array(data)).readFields(this.readData, {});
  }

  readData(tag, data, pbf) {
    getFieldAndMethod(tag, data, pbf)
  }
}