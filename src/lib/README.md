POP COMMON OVERVIEW
=====================================================================

Pop Common is a Library that is intended to support the PopCx sites.

Pop Common will provide a central place to store shared css, models, directive, pipes, and service. 

Pop Common is also organized into several Modules.

App 
=====================================================================

This module is already included in the base pop-common.module

This contains all the code necessary to provide a common template between the sites.

Import PopTemplateModule into your App module file. Replace the template in your app.component.ts file with <lib-pop-template [menus]=menus></lib-pop-template>

Base
=====================================================================

This modules contains the lower-level building blocks of constructing a site.

  * If your app needs to build a variety of custom components this module will give you boiler plate for inputs, tables, tab menus, dialogs, etc.

  * Components in this module could be considered very config and event driven. Ie.. this components are built to be dumb as possible, and rely on the developer to 
    pass in meaningful configs and perform actions based off of the events that these components provide.

  * Some important services to consider ...
    * HeaderInterceptor, Response401Interceptor - provide these in your app.module.ts to attach appropriate headers to access api and 401 responses
    .... app.module.ts ...
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: Response401Interceptor, multi: true },
      ],
    .......
  * PopBaseService - Central location where localStorage, session, and Auth User
  * PopCredentialService  - Provides methods manage authentication and token storage.
  * PopRequestService - Use this service rather than basic HttpClient for api calls that you make to the PopCx Api
  
  * Some important components to consider ...
      * PopExtendComponent - Extend this component whenever you are building a complex component. It will setup useful boilerplate to manage subscriptions, 
        timeouts, ui, assets, logs, etc.
      * PopExtendDynamicComponent - Extend this component whenever you are building a component that renders dynamic content (Component extends PopExtendComponent)

Entity
=====================================================================
  * Entity: This typically represent a top-level database table that has a primary id. Each app will have a set of entities that it need to present in the app. User, Client, Account, etc...
  
  * This module is an subset of the base module that organizes the lower-level components in a very opinionated way.

  * If your app is an entity centric this module is a must have, since it will allow us to have a consistent presentation for entities across all of the apps.
  
  * Some important models to consider ...
    * CoreConfig - This model is the main building block of any component built in this module. (You really need to have a rock solid understanding of what this is)

  * Some important services to consider ...
    * PopEntityService - This handles the bulk of what a entity needs and does to generate a CoreConfig
    * PopEntityRepoService - This is generated for each different entity that your app uses. Its purpose is to to allow a uniform interface, but allow each 
      entity to have its own nuances and override specific default behavior.
      
    * Some important components to consider ...
          * PopEntityListComponent - This is a top-level component. This will show a table list of a specific entity
          * PopEntityTabMenuComponent - This is top-level component. This is used to show a specific entity
            * PopEntityTabComponent - A PopEntityTabMenuComponent will be configured to with a custom set of tabs. This component will handle rendering the active tab
      
   
Material
=====================================================================

  * This module imports the majority of the Angular Material modules, if your app is going to take advantage of Angular Material, this is required

 
