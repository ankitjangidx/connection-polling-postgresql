const app = require("express")();
const { Pool } = require("pg");
const { Client } = require("pg");
const { performance } = require("node:perf_hooks");

let oldCount = 0;
let oldSum = 0;
let poolCount = 0;
let poolSum = 0;

const pool = new Pool({
  user: "myuser",
  host: "localhost",
  database: "learning",
  password: "mypassword",
  port: parseInt("5432"),
  max: 10,
});

app.get("/old", async (req, res) => {
  const fromDate = performance.now();
  oldCount++;

  const client = new Client({
    user: "myuser",
    host: "localhost",
    database: "learning",
    password: "mypassword",
    port: parseInt("5432"),
  });

  //connect
  await client.connect();
  //return all rows
  const results = await client.query("SELECT pg_sleep(0.2);");
  // console.table(results.rows);
  //end
  client.end();

  const toDate = performance.now();
  // console.log(fromDate);
  // console.log(toDate);
  const elapsed = toDate - fromDate;
  oldSum += elapsed;

  //send it to the wire
  res.send({
    rows: results.rows,
    elapsed: elapsed,
    avg: Math.round(oldSum / oldCount),
    method: "old",
  });
});

app.get("/pool", async (req, res) => {
  const fromDate = performance.now();
  poolCount++;
  //return all rows
  const results = await pool.query("SELECT pg_sleep(0.2);");
  // console.table(results.rows);

  const toDate = performance.now();
  // console.log(fromDate);
  // console.log(toDate);
  const elapsed = toDate - fromDate;
  poolSum += elapsed;
  //send it to the wire
  res.send({
    rows: results.rows,
    elapsed: elapsed,
    avg: Math.round(poolSum / poolCount),
    method: "pool",
  });
});

app.listen(9000, () => console.log("Listening on port 9000"));

/*

for (let i = 0; i < 1000; i++) fetch(`http://localhost:9000/old`).then(a=>a.json()).then(console.log).catch(console.error);
for (let i = 0; i < 1000; i++) fetch(`http://localhost:9000/pool`).then(a=>a.json()).then(console.log).catch(console.error);

*/
