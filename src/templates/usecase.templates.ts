export const usecaseTemplate = (className: string) =>
  `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className} {
  constructor(
    // Inject your repositories, domain services, etc.
    // private readonly userRepository: UserRepository,
    // private readonly userDomainService: UserDomainService,
    // private readonly eventBus: EventBus,
  ) {}

  // Add your use case application logic here
}
`;

export const usecaseIndexTemplate = (usecaseName: string, fileName: string) =>
  `export { ${usecaseName} } from './${fileName}.usecase';
`;
