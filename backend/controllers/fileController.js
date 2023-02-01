import fs from 'fs'
import path from 'path';
import { dbConnect, addData, getData } from '../utils/db.js';

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

const saveToDb = async (req, res) => {
    try {
        await dbConnect();
        addData(req.body.pdf, req.body.option, req.body.page, (err, result) => {
            if (err) {
              res.status(500).send('Error adding data');
            } else {
                console.log(result)
              res.send('Data added successfully');
            }
          });

    } catch (error) {
        console.error(error)
    }
}

const getStatus = async (req, res) => {
    try {
        await dbConnect();
        getData((err, result) => {
            if (err) {
              res.status(500).send('Error adding data');
            } else {
                console.log(result)
              res.status(200).send(result?.rows);
            }
          });

    } catch (error) {
        console.error(error)
    }
}
export {
    main,
    saveToDb,
    getStatus
}
