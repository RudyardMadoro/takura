package architecturefixture.controller;

import architecturefixture.infrastructure.persistence.ForbiddenEntity;

public class ForbiddenController {
    ForbiddenEntity forbidden() {
        return new ForbiddenEntity();
    }
}
