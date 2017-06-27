const yargs = require('yargs');

yargs.command(['display [username] [password]', '* [username] [password]'], 'Display the timetable in terminal', (yargss) => {
    yargss.option('json', {
      alias: 'j',
      describe: 'Print as json',
      default: false,
      type: 'boolean'
    });
}, (argv) => {
    require('./display')(argv);
});

yargs.command('login <username> <password>', 'Save login credentials permanantly.', () => {}, (argv) => {
    require('./login')(argv);
});

yargs.help();

const argv = yargs.argv;
