# Backend module map

Business modules are `content`, `catalogue`, `enquiries`, `assessments`, `quotations`, `media`, `identity`, `communications`, `payments` and `operations`. Each module owns its controller, application, domain and infrastructure boundaries. Controllers translate transport DTOs, application services enforce transactions and permissions, domain code owns state rules, and infrastructure implements repositories or providers. Modules collaborate through application/domain interfaces and must not reach into another module's repositories.

The payments package contains an isolated disabled extension contract only. There are no checkout routes, reservations, inventory processes, quote generation, electronic acceptance or financial calculators in R1 phase 01.
