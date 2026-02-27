const fs = require("fs");
const { exec } = require("child_process");
const fixCode = require("./fixer");

const TEMP_FILE = "../temp/Test.java";

module.exports = function runJava(code) {
  return new Promise((resolve) => {

    fs.writeFileSync(TEMP_FILE, code);

    exec(`javac ${TEMP_FILE}`, (err, stdout, stderr) => {
      if (err) {
        const fixed = fixCode(code, stderr);
        return resolve({
          success: false,
          error: stderr,
          fixedCode: fixed
        });
      }

      exec("java -cp temp Test", (err2, stdout2, stderr2) => {
        if (err2) {
          return resolve({ success: false, error: stderr2 });
        }

        resolve({ success: true, output: stdout2 });
      });
    });
  });
};
