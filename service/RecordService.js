const { fetchSpecificRecordData } = require('../firebase/firebaseMethods');

const getListOfPortNamesOverall = (data) => {
    const portNames = [];
    data.forEach(record => {
        const prePortOrder = record.prePortOrder;
        prePortOrder.forEach(port => {
            portNames.push(port.name);
        });
    });
    const distinctPortNames = new Set(portNames);
    return distinctPortNames;
};

const getListOfPortNamesIndiv = (record) => {
    const portNames = [];
    const prePortOrder = record.prePortOrder;
    prePortOrder.forEach(port => {
        portNames.push(port.name);
    });
    return portNames;
};

const getSubRecords = (record) => {
    const portNames = getListOfPortNamesIndiv(record);
    const prePortOrder = record.prePortOrder;
    const postPortOrder = record.postPortOrder;
    const shipName = record.shipName;
    const listOfSubRecords = [];

    portNames.forEach(portNameIndiv => {
        let originalPort = null;
        let newPort = null;

        for (let i = 0; i < prePortOrder.length; i++) {
            //console.log(portNameIndiv);
            //console.log(prePortOrder[i].name);
            if (prePortOrder[i].name === portNameIndiv) {
                originalPort = prePortOrder[i];
                break; // Stop when we find the first match
            }
        }

        for (let i = 0; i < postPortOrder.length; i++) {
            if (postPortOrder[i].name === portNameIndiv) {
                newPort = postPortOrder[i];
                break; // Stop when we find the first match
            }
        }

        //console.log(originalPort);

        const oldBerth = originalPort?.berth || "-";
        const oldETA = originalPort?.estimatedTimeOfArrival || "-";
        const newBerth = newPort?.berth || "-";
        const newETA = newPort?.estimatedTimeOfArrival || "-";
        const subRecord = {
            shipName,
            oldBerth,
            oldETA,
            newBerth,
            newETA,
            portName: portNameIndiv,
        };
        listOfSubRecords.push(subRecord);
    });

    return listOfSubRecords;
};

const getTotalSubRecords = (records) => {
    let listOfTotalSubRecords = [];
    for (const record of records) {
        const subRecords = getSubRecords(record);
        listOfTotalSubRecords = listOfTotalSubRecords.concat(subRecords);
    }
    return listOfTotalSubRecords;
};

const getFinalData = async (newsTitle) => {
    const data = await fetchSpecificRecordData(newsTitle);
    const listOfPortNames = getListOfPortNamesOverall(data);
    const listOfSubRecords = getTotalSubRecords(data);

    return [listOfPortNames, listOfSubRecords];
};

module.exports = { getFinalData };