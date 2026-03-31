# Developer instructions
You're an expert fullstack developer.
When building an application, the project might contain a frontend and a backend sub-projects.

# Main directory of the project
- Parent dir: "C:\dev\projects"
- Separate folders for backend and frontend
- For example, if the project name is "online-store" then a new folder with the name "online-store" will be created under "C:\dev\projects". The frontend project directory will be "C:\dev\projects\frontend" and the backend directory will be "C:\dev\projects\backend"
- Initialize the folder with git

# Frontend and Backend integration:
- Use REST API's for the integration between the fronend and the backend.
- If instant messaging is needed, use WebSockets

## Forntend sub-project:
- Use latest ReactJS version with Vite, Redux and Axios
- Use latest React Router
- Use Material-UI
- Use ESLint + Prettier + Husky
- Add component tests
- Do not hard code colors
- Do not use `div`s if there's a component already

### frontend sub-project structure
```
frontend-project/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common components
│   │   └── ui/            # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom Hooks
│   ├── store/             # State management
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   ├── constants/         # Constants
│   ├── App.tsx
│   └── main.tsx
├── tests/                 # Test files
├── docs/                  # Project documentation
├── .env.example           # Environment variables example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
- see `App.tsx` for routes

### Component Development Standards
1. **Function Components First**: Use function components and Hooks
2. **TypeScript Types**: Define interfaces for all props
3. **Component Naming**: Use PascalCase, file name matches component name
4. **Single Responsibility**: Each component handles only one functionality

### Safety and permissions
Allowed without prompt:
- read files, list files
- tsc single file, prettier, eslint,
- vitest single test

## Backend sub-project:
- Use the latest LTS Java version
- Use maven
- Use the latest stable (GA) Spring Boot version
- Use Lombok
- Use MongoDB
- Create unit tests for Spring Services, Repositories and Controllers

## Code Formatting:
- Blank Lines: Use to separate logical blocks of code.
- Line Length: Maximum 120 characters.
- Use IntelliJ IDEA default code style for Java.

## Java Style
- Use UTF-8 encoding.
- Use descriptive names for classes, methods, and variables.
- Avoid `var` keyword, prefer explicit types.
- Avoid mutations of objects, specially when using for-each loops or Stream API using `forEach()`.
- Avoid magic numbers and strings; use constants instead.
- Check emptiness and nullness before operations on collections and strings.
- Avoid methods using `throws` clause; prefer unchecked exceptions.
- Avoid comments.
- Comments could be applied for: CRON expressions, RegEx patterns, TODOs or given/when/then separation in tests.
- Use `@Override` annotation when overriding methods.
- Avoid "Objects.isNull()" and "Objects.nonNull()" for one or two variables; prefer direct null checks for better performance.
- Wrap multiple conditions in a boolean variable for better readibility
- Prefer early returns.
- Avoid else statements when not necessary and try early returns.

## Lombok Annotations
- Use `@RequiredArgsConstructor` from Lombok for dependency injection via constructor.
- Use `@Slf4j` from Lombok for logging.
- Use `@Builder` for complex object creation.
- Avoid `@Data` annotation; prefer `@Getter` and `@Setter` for granular control.

## Annotations
- **`@Service`**: For business logic classes.
- **`@Repository`**: For data access classes that extend Repository or interact with the database.
- **`@RestController`**: For web controllers.
- **`@Component`**: For generic Spring components.
- **`@Configuration`**: For Spring configuration classes.
- **`@Autowired`**: Prefer constructor injection for production code and field injection only for tests.
- **`@ConfigurationProperties`**: For binding related properties avoid multiple `@Value` annotations. From more than 2 properties, consider using this annotation.
- **`@Transactional`**: Only Service classes should be annotated with @Transactional at class level to avoid transaction management in each method.
- **`@Validated`**: To enable Bean Validation in method parameters or classes.
- **`@PreAuthorize`**: at the controller layer when using Spring Security to enforce method-level security.
- Circular dependencies should be avoided. Avoid `@Order` annotation for dependency resolution.

## Mappers
- Use MapStruct
- MapFor mapping between DTOs and entities.
- Define mapper interfaces with `@Mapper` annotation.
- Use `@Mapping` annotation for custom field mappings.
- Use `componentModel = "spring"` to allow Spring to manage mapper instances.
- Mapper should have as suffix `Mapper` (e.g., `UserMapper`).
- Name mapper methods clearly (e.g., `toDto`, `toEntity`).
- Example Mapper Interface:
  ```java
  @Mapper(componentModel = "spring")
  public interface UserMapper {
      @Mapping(source = "email", target = "emailAddress")
      UserDTO toDto(User user);
      @Mapping(source = "emailAddress", target = "email")
      User toEntity(UserDTO userDto);
  }
  ```
- For testing mappers, use `Mappers.getMapper(UserMapper.class)` to get an instance of the mapper.

## Exception Handling
- Custom Exceptions: Create custom domain exception classes extending `RuntimeException`.
- Global Exception Handler: Use `@ControllerAdvice` and `@ExceptionHandler` to handle exceptions globally.
- HTTP Status Codes: Map exceptions to appropriate HTTP status codes in REST controllers.
- Error Response Structure: Define a consistent error response structure

## Testing
- Use latest JUnit for unit and integration testing.
- Use Mockito for mocking dependencies in unit tests.
- Use `@WebMvcTest(ControllerClass.class)` for testing Spring MVC controllers.
- Use `@SpringBootTest` for integration tests that require the Spring context.
- Use `given/when/then` structure in test methods for clarity.
- Method naming could follow snake_case or camelCaset convention for test methods (e.g., `get_user_by_id_ok`, `get_user_by_id_not_found_ko`).
- Avoid reflection in tests.
- Avoid business logic in tests; focus on behavior verification.

## Logging
- Use `@Slf4j` annotation from Lombok for logging to avoid boilerplate code with Logger instances.
- Log at appropriate levels: `DEBUG`, `INFO`, `WARN`, `ERROR`.
- Include contextual information in logs (e.g., request IDs, user IDs).
- Avoid logging sensitive information.
- Use structured logging for better log management.
- Format log messages with placeholders (e.g., `{}`) instead of string concatenation.

# Packaging
The final artifact will be a JAR file, that contains BOTH the backend and frontend artifacts. To do that, create a script that does the following steps:
1. Build the frontend project
2. Copy the output to the "resources/static" folder of the backend
3. Build the backend project