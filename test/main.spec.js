import test from 'ava'
import { RasterGeobuf } from '../src/RasterGeobuf'


test('RasterGeobuf test', async t => {

  console.time('LoadAndSave')
  var gb = new RasterGeobuf()
  await gb.loadGeoTiff()
  await gb.savePBF()
  console.timeEnd('LoadAndSave')

  console.time('Read')
  var gb2 = new RasterGeobuf()
  gb2.readPBF('georaster.pbf')
  console.timeEnd('Read')

  t.is(1,1)
})