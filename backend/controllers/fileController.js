import fs from 'fs'
import path from 'path';

const main = async (req, res) => {
    res.status(200).json(
        getAllFiles('pdf')
    )
}

const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        console.log('name', name)
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);

export {
    main
}
