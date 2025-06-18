export const commandTemplate = (className: string) => `import { ICommand } from '@nestjs/cqrs';

export class ${className} implements ICommand {
  constructor(
    // Add your command properties here
    // public readonly id: string,
    // public readonly data: CreateUserDto,
  ) {}
}
`;

export const commandHandlerTemplate = (commandName: string, handlerName: string, fileName: string) => `import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ${commandName} } from './${fileName}.command';

@CommandHandler(${commandName})
export class ${handlerName} implements ICommandHandler<${commandName}> {
  constructor(
    // Inject your repositories, services, etc.
    // private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ${commandName}): Promise<any> {
    // Handle the command here
    console.log('Executing command:', command);
    
    // Example: Validate, save to database, publish events, etc.
    // const result = await this.userRepository.save(command.data);
    // return result;
  }
}
`;

export const commandIndexTemplate = (commandName: string, handlerName: string, fileName: string) => `export { ${commandName} } from './${fileName}.command';
export { ${handlerName} } from './${fileName}.handler';
`; 