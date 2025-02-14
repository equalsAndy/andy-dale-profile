
## Deployment

To deploy the project, follow these steps:

1. Navigate to the project's root directory:
    ```bash
    cdandy
    ```

2. Install the necessary dependencies:
    ```bash
    npm install
    ```

3. Navigate to the client directory:
    ```bash
    cd client
    ```

4. Install the client dependencies:
    ```bash
    npm install
    ```

5. Build the project:
    ```bash
    npm run build
    ```

6. Restart the server:
    ```bash
    pm2 restart 0
    ```

7. Restart the client:
    ```bash
    pm2 restart client
    ```



## Testing

To execute tests in this project, follow the steps below:

### Playwright Tests
Run the Playwright tests by navigating to the project's root directory in your terminal and executing:

```bash
npx playwright test
```

### Jest Tests

Run the Jest tests with the following command:
```bash
npm run test
```