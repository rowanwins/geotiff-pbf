export const fields = [
  {
    name: 'maxs',
    id: 0,
    type: 'PackedSFixed32'
  },
  {
    name: 'mins',
    id: 1,
    type: 'PackedSFixed32'
  },
  {
    name: 'ranges',
    id: 2,
    type: 'PackedSFixed32'
  },
  {
    name: 'no_data_value',
    id: 3,
    type: 'Float'
  },
  {
    name: 'pixelWidth',
    id: 4,
    type: 'Varint'
  },
  {
    name: 'pixelHeight',
    id: 5,
    type: 'Varint'
  },
  {
    name: 'projection',
    id: 6,
    type: 'Varint'
  },
  {
    name: 'height',
    id: 7,
    type: 'Varint'
  },
  {
    name: 'width',
    id: 8,
    type: 'Varint'
  },
  {
    name: 'number_of_rasters',
    id: 9,
    type: 'Varint'
  },
  {
    name: 'xmax',
    id: 10,
    type: 'Fixed32'
  },
  {
    name: 'xmin',
    id: 11,
    type: 'Fixed32'
  },
  {
    name: 'ymin',
    id: 12,
    type: 'Fixed32'
  },
  {
    name: 'ymax',
    id: 13,
    type: 'Fixed32'
  },
  {
    name: 'data',
    id: 14,
    type: 'Message'
  }
]


export function getFieldAndMethod(tag, data, pbf) {
  return data[fields[tag].name] = typeReader(fields[tag].type, pbf)
}

function typeReader (type, pbf) {
  if (type === 'Fixed32') return pbf.readFixed32()
  if (type === 'PackedSFixed32') return pbf.readPackedSFixed32()
  if (type === 'Float') return pbf.readFloat()
  if (type === 'Message') return pbf.readMessage(readLayerData, {rows:[]})
}

function readLayerData(tag, layer, pbf) {
  if (tag === 1) layer.name = pbf.readString()
  if (tag >= 2) {
   layer.rows[tag - 2] = pbf.readMessage(readRowValues, {vals: []})
  }
}

function readRowValues(tag, layer, pbf) {
  var tempVal = pbf.readPackedFloat()
  var out = new Array(tempVal[1]).fill(tempVal[0])
  layer.vals = layer.vals.concat(out)
}