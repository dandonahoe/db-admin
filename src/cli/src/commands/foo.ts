import { Args, Command, Flags } from '@oclif/core';
import inquirer from 'inquirer';

export default class Foo extends Command {
  static override args = {
    file: Args.string({ description: 'file to read' }),
  };

  static override description = 'describe the command here';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Foo);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from /workspaces/db-admin/src/cli/src/commands/foo.ts`);
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }

    // Add the Inquirer.js menu
    const choices = [
      { name: 'Greet the world', value: 'greet' },
      { name: 'Show file details', value: 'file' },
      { name: 'Exit', value: 'exit' },
    ];

    const prompt = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices,
      },
    ]);

    switch (prompt.action) {
      case 'greet':
        this.log(`Hello, ${name}!`);
        break;
      case 'file':
        if (args.file) {
          this.log(`You selected the file: ${args.file}`);
        } else {
          this.log('No file provided.');
        }
        break;
      case 'exit':
        this.log('Goodbye!');
        break;
      default:
        this.log('Invalid option selected.');
    }
  }
}
