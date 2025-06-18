export const queryTemplate = (className: string) =>
  `import { IQuery } from '@nestjs/cqrs';

export class ${className} implements IQuery {
  constructor(
    // Add your query properties here
    // public readonly id: string,
    // public readonly filters?: QueryFilters,
  ) {}
}
`;

export const queryHandlerTemplate = (queryName: string, handlerName: string, fileName: string) =>
  `import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ${queryName} } from './${fileName}.query';

@QueryHandler(${queryName})
export class ${handlerName} implements IQueryHandler<${queryName}> {
  constructor(
    // Inject your repositories, services, etc.
    // private readonly userRepository: UserRepository,
  ) {}

  async execute(query: ${queryName}): Promise<any> {
    // Handle the query here
    console.log('Executing query:', query);
    
    // Example: Fetch data from database, apply filters, etc.
    // const result = await this.userRepository.findById(query.id);
    // return result;
  }
}
`;

export const queryIndexTemplate = (queryName: string, handlerName: string, fileName: string) =>
  `export { ${queryName} } from './${fileName}.query';
export { ${handlerName} } from './${fileName}.handler';
`;
