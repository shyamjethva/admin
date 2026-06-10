const fs = require("fs");
const { Client } = require("ssh2");

const source = fs.readFileSync("check_real_admin.js", "utf8");
const pick = (key) => {
  const match = source.match(new RegExp(`${key}:\\s*(?:'([^']+)'|(\\d+))`));
  if (!match) throw new Error(`Missing ${key} in check_real_admin.js`);
  return match[1] || match[2];
};

const command = process.argv.slice(2).join(" ");
if (!command) {
  console.error("Usage: node exec_remote.js <command>");
  process.exit(1);
}

const conn = new Client();
conn
  .on("ready", () => {
    conn.exec(command, (err, stream) => {
      if (err) throw err;
      stream
        .on("close", (code, signal) => {
          console.log(`EXIT ${code}${signal ? ` SIGNAL ${signal}` : ""}`);
          conn.end();
        })
        .on("data", (data) => process.stdout.write(data));
      stream.stderr.on("data", (data) => process.stderr.write(data));
    });
  })
  .connect({
    host: pick("host"),
    port: Number(pick("port")),
    username: pick("username"),
    password: pick("password"),
  });
