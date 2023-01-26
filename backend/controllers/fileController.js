import dotenv from 'dotenv';
import fs from 'fs'
import path from 'path';
dotenv.config()

const {DIRECTORY} = process.env;


const main = async (req, res) => {
    console.log(JSON.parse(JSON.stringify(getAllFiles('pdf'))))
    res.status(200).json(
        getAllFiles('pdf')
    )
}

const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);

export {
    main
}
