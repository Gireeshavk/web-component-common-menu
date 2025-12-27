
# MenuUi Library

`panel-drift-menu` is an Angular library for menu UI components.

## Installation

Install the library from npm:

```bash
npm install panel-drift-menu
```

### Peer Dependencies

Make sure your project has the following peer dependencies installed:

- `@angular/core` ^20.3.0
- `@angular/common` ^20.3.0

You may also need:
- `@angular/cdk` ^20.2.3
- `ngx-toastr` ^19.0.0

## Usage

1. **Import the Module/Component**

   If the library exports a standalone component:

   ```typescript
   import { MenuUi } from 'panel-drift-menu';
   ```

2. **Add to Your Module or Standalone Imports**

   For standalone usage (Angular 14+):

   ```typescript
   import { bootstrapApplication } from '@angular/platform-browser';
   import { AppComponent } from './app/app.component';
   import { MenuUi } from 'panel-drift-menu';

   bootstrapApplication(AppComponent, {
     providers: [],
     imports: [MenuUi]
   });
   ```

   Or, if using NgModule:

   ```typescript
   import { MenuUi } from 'panel-drift-menu';

   @NgModule({
     imports: [MenuUi],
     // ...
   })
   export class AppModule {}
   ```

3. **Use in Template**

   ```html
   <lib-menu-ui></lib-menu-ui>
   ```

## Building the Library (for contributors)

To build the library locally:

```bash
ng build menu-ui
```

Artifacts will be in the `dist/menu-ui` directory.

## Publishing (for maintainers)

After building, publish with:

```bash
cd dist/menu-ui
npm publish
```

## Running Unit Tests

```bash
ng test menu-ui
```

## License

MIT
