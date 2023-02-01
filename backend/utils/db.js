import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

let client = null;
const dbConnect = async () => {
    client = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    await client.connect();
}


// const addData = async (pdf, option, page, callback) => {
//     // const sql = 'INSERT INTO pdf_table (pdf, option, page) VALUES ($1, $2, $3)';
//     const sql = 'INSERT INTO pdf_table (pdf, option, page) VALUES ($1, $2, $3)';

//     const params = [pdf, option, page];
//     await client.query(sql, params, (err, result) => {
//       if (err) {
//         console.error(err);
//         callback(err);
//       } else {
//         callback(null, result);
//       }
//     });
//   };

const addData = async (pdf, option, page, callback) => {
    const checkTableSql = 'SELECT 1 FROM information_schema.tables WHERE table_name = \'pdf_table\'';
    const createTableSql = `
      CREATE TABLE pdf_table (
        id serial PRIMARY KEY,
        pdf text NOT NULL,
        option text NOT NULL,
        page text NOT NULL,
        status boolean DEFAULT false
      );
    `;
    // const insertDataSql = 'INSERT INTO pdf_table (pdf, option, page) VALUES ($1, $2, $3)';
    const insertDataSql = `
    WITH new_data (pdf, option, page) AS (
      VALUES ($1, $2, $3)
    ),
    updated AS (
      UPDATE pdf_table SET page = new_data.page
      FROM new_data
      WHERE pdf_table.pdf = new_data.pdf AND pdf_table.option = new_data.option
      RETURNING *
    )
    INSERT INTO pdf_table (pdf, option, page)
    SELECT pdf, option, page
    FROM new_data
    WHERE NOT EXISTS (SELECT * FROM updated)`;

    const updateStatusSql = `
    WITH new_data (pdf) AS (
        VALUES ($1)
    ),
    updated AS (UPDATE pdf_table SET status = true
    WHERE (
      SELECT COUNT(*)
      FROM pdf_table
      WHERE pdf = new_data.pdf
    ) = 4)
    `

    const params = [pdf, option, page];
    const checkStatusSql = `SELECT COUNT(*) FROM pdf_table WHERE pdf = $1 and status = false`;
    const checkPdfParams = [pdf];
    await client.query(checkTableSql, (err, result) => {
      if (err) {
        console.error(err);
        callback(err);
      } else if (result.rowCount === 0) {
        client.query(createTableSql, (err, result) => {
          if (err) {
            console.error(err);
            callback(err);
          } else {
            client.query(insertDataSql, params, (err, result) => {
              if (err) {
                console.error(err);
                callback(err);
              } else {
                callback(null, result);
              }
            });
          }
        });
      } else {
        client.query(insertDataSql, params, (err, result) => {
          if (err) {
            console.error(err);
            callback(err);
          } else {
            client.query(checkStatusSql, checkPdfParams, async (err, result) => {
                if (err) {
                    console.error(err);
                    callback(err);
                }
                else {
                    const count = parseInt(result.rows[0].count);
                    if (count === 3) {
                        // If there are already 3 rows, update the status to true
                        const updateSql = `UPDATE pdf_table SET status = true WHERE pdf = $1 and status = false`;
                        const updateParams = [pdf];
                        await client.query(updateSql, updateParams, (updateErr, updateResult) => {
                            if (updateErr) {
                                console.error(updateErr);
                                callback(updateErr);
                              } else {
                                callback(null, updateResult);
                              }
                        })
                    }
                    else {
                        callback(null, result);
                    }
                }
            })
          }
        });
      }
    });

    
  };

  const getData = async (callback) => {
    try {
      const checkStatusWiseData = "SELECT DISTINCT(pdf), status from pdf_table WHERE status = true"
      // const param = [pdf];
      await client.query(checkStatusWiseData, (err, res) => {
          if (err) {
              console.error(err);
              callback(err);
            } else {
              console.log("res", res)
              callback(null, res);
            }
      })
    } catch (error) {
      console.error(error)
    }
      
  }

export {
    dbConnect,
    addData,
    getData
}