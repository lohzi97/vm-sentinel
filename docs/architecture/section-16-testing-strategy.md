# Section 16: Testing Strategy

### Testing Pyramid
```
      /|\
     / | \
    /  |  \   End-to-End (E2E) Tests (Manual for MVP)
   /___|___
  /         \
 /           \  Integration Tests (Bot <-> Mocks, Agent <-> Mocks)
/_____________
/               \
/                 \ Unit Tests (Modules, Handlers, Utilities)
/___________________
```

### Test Organization

- **Unit Tests:** These will be co-located with the source code in `__tests__` directories or in a top-level `tests/` folder within each application (`apps/bot`, `apps/agent`). They will test individual functions and modules in complete isolation, mocking all external dependencies (e.g., Pub/Sub clients, APIs, filesystem).
- **Integration Tests:** These will also live within each application's `tests/` folder. They will test the interactions between internal modules of an application. For example:
    - **Bot:** Testing that a command handler correctly calls the Pub/Sub service module.
    - **Agent:** Testing that the main service correctly initializes all monitoring modules and responds to mock Pub/Sub events.
- **End-to-End (E2E) Tests:** For the MVP, E2E testing will be a **manual process**. The developer will follow a script to test the full flow, from sending a command on Telegram to verifying the action on the VM. Automated E2E tests are out of scope due to their complexity.

### Test Examples

**Bot Unit Test Example (`apps/bot/src/handlers/__tests__/commands.test.ts`):**
```typescript
import { handleStartCommand } from '../commands';

// Mock the Telegraf context object
const mockCtx = {
  reply: jest.fn(),
};

describe('handleStartCommand', () => {
  it('should reply with a welcome message', async () => {
    await handleStartCommand(mockCtx as any);
    
    // Verify that the reply function was called with the expected text
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Welcome to VM Sentinel!')
    );
  });
});
```

**Agent Unit Test Example (`apps/agent/src/modules/__tests__/IdleManager.test.ts`):**
```typescript
import { IdleManager } from '../IdleManager';

describe('IdleManager', () => {
  jest.useFakeTimers();

  it('should emit an "idle-detected" event after the timeout', () => {
    const idleManager = new IdleManager({ idle_timeout_minutes: 10 });
    const spy = jest.spyOn(idleManager, 'emit');

    // Simulate no activity
    idleManager.updateLastInputTime(Date.now() - 11 * 60 * 1000);
    idleManager.updateLastScreenChangeTime(Date.now() - 11 * 60 * 1000);

    idleManager.checkIdleState();

    expect(spy).toHaveBeenCalledWith('idle-detected');
  });
});
```
