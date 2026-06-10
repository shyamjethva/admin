const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  const cmds = [
    'sed -i "s/127.0.0.1:5000/127.0.0.1:5011/g" /etc/nginx/sites-available/admin.errorinfotech.in',
    'systemctl reload nginx'
  ].join(' && ');

  conn.exec(cmds, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '69.62.82.12',
  port: 22,
  username: 'root',
  password: 'Eri404@scale'
});
