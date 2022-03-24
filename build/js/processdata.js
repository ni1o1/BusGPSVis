onmessage = ({ data }) => {
    const field = data[0]
    const tableinfo = data[1]


    const id = field['ID']
    const time = field['Time']
    const lon = field['Lon']
    const lat = field['Lat']
    const tripdata_tmp = {}
        //对数据进行排序
    tableinfo.data = tableinfo.data.sort(
            function compareFunction(param1, param2) {
                return param1[time].localeCompare(param2[time], "zh");
            }
        )
        //操作时间字段
    if (tableinfo.data[0][time].indexOf(':') == 2) {
        tableinfo.data.map((f, index) => { tableinfo.data[index][time] = '2000-01-01 ' + f[time] })
    }
    //计算动画时长
    const starttime = new Date(tableinfo.data.reduce((prev, next) => {
        return prev[time] > next[time] ? next : prev
    }, tableinfo.data[0])[time]).valueOf()
    const endtime = new Date(tableinfo.data.reduce((prev, next) => {
        return prev[time] < next[time] ? next : prev
    }, tableinfo.data[0])[time]).valueOf()
    const loopLength = (endtime - starttime) / 1000

    tableinfo.data.map(r => {
        if (typeof tripdata_tmp[r[id]] === 'undefined') {
            tripdata_tmp[r[id]] = {
                'geometry': {
                    'coordinates': [
                        [parseFloat(r[lon]), parseFloat(r[lat])]
                    ]
                },
                'properties': {
                    'timestamp': [(new Date(r[time]).valueOf() - starttime) / 1000],
                    'id': r[id]
                }
            }
        } else {
            tripdata_tmp[r[id]].geometry.coordinates = [...tripdata_tmp[r[id]].geometry.coordinates, [parseFloat(r[lon]), parseFloat(r[lat])]]
            tripdata_tmp[r[id]].properties.timestamp = [...tripdata_tmp[r[id]].properties.timestamp, (new Date(r[time]).valueOf() - starttime) / 1000]
        }
    })
    const tripdata = []
    for (let i in tripdata_tmp) { tripdata.push(tripdata_tmp[i]) }


    postMessage([{
        trips: tripdata,
        loopLength: loopLength,
        starttime: starttime
    }]);
}