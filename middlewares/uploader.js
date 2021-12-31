const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.randomFilename = (length) => {
    return crypto
        .randomBytes(length)
        .toString("hex");
}

exports.getValidExtension = (filename) => {
    const formatAllowed = ["jpg", "jpeg", "png"];

    const ext = filename
        .substr(filename.lastIndexOf(".") + 1)
        .toLowerCase();

    if (formatAllowed.indexOf(ext) > -1) {
        return ext;
    }
    else {
        return false;
    }
}

exports.saveImage = (pathFrom, pathTo) => {
    try {
        if (!fs.existsSync(pathTo)) {
            const destination = path.dirname(pathTo);
            fs.mkdirSync(destination, { recursive: true });
        }

        fs.renameSync(pathFrom, pathTo);
    }
    catch (error) {
        throw (message = error);
    }
}