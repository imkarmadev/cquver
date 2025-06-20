export const serviceTemplate = (className: string) =>
  `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className} {
  constructor(
    // Inject your repositories, other services, etc.
    // private readonly userRepository: UserRepository,
    // private readonly eventBus: EventBus,
  ) {}

  // Add your domain business logic methods here
}
`;

export const serviceIndexTemplate = (serviceName: string, fileName: string) =>
  `export { ${serviceName} } from './${fileName}.service';
`;
