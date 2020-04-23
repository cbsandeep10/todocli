const {Command, flags} = require('@oclif/command')
const chalk = require('chalk')
const fs = require('fs')
const touch = require("touch")
const ora = require('ora')
const boxen = require('boxen')

const log = console.log
const dir = `${process.env.HOME}/.todocli`
const file = `${dir}/todocli.json`

const colors = ['red', 'green', 'blue', 'magenta', 'cyan', 'white','gray']

function random() {
  return Math.floor(
    Math.random() * colors.length
  )
}

class TodocliCommand extends Command {
  async run() {
    // Flags
    const {flags} = this.parse(TodocliCommand)

    //File reading and creation
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    var data = {
        list: []
    }
    if (fs.existsSync(file)){
        const rawdata = fs.readFileSync(file)
        data = JSON.parse(rawdata)
    }else{
        touch.sync(file)
    }
    if(flags.add){
        const spinner = ora(chalk.blue('Adding todo')).start();

        data.list.unshift(flags.add)
        fs.writeFileSync(file, JSON.stringify(data))
        setTimeout(() => {
            spinner.succeed(chalk.green('Added Todo!'))
        }, 1000);
    }
    else if(flags.delete){
        const { MultiSelect } = require('enquirer');

        var choices = []
        for(let i =0;i<data.list.length;i++){
            choices.push({
                name:data.list[i],
                value:i
            })
        }

        const prompt = new MultiSelect({
          name: 'Delete',
          message: 'Select from the list to delete?',
          choices: choices,
          result(names) {
                return this.map(names);
            }
        });
        prompt.run()
          .then(answer => {
              const spinner = ora(chalk.blue('Deleting todos')).start();
              for(var key in answer){
                  data.list.splice(answer[key], 1);
              }
              if(data.list == [null]){
                  data.list = []
              }
              fs.writeFileSync(file, JSON.stringify(data))
              setTimeout(() => {
                  spinner.succeed(chalk.green('Deleted Todos!'))
              }, 1000);
          })
          .catch(console.error);
    }
    else{
        log(boxen('||Your todo lists||'))
        for(var i=0; i<data.list.length; i++){
            var color = chalk.keyword(colors[random()]);
            log(color('* '+data.list[i]))
        }
    }
  }
}

TodocliCommand.description = `
A CLI for todo application.
`

TodocliCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  add: flags.string({char: 'a', description: 'Add new todo'}),
  delete: flags.boolean({char: 'd', description: 'Delete a todo'}),
}

module.exports = TodocliCommand
