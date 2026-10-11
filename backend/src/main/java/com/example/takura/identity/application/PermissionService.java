package com.example.takura.identity.application;

import com.example.takura.identity.domain.StaffPrincipal;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {
    public void require(StaffPrincipal principal, String operation) {
        if (!principal.may(operation)) {
            throw new AccessDeniedException("Required operation is not granted");
        }
    }

    public void requireRecord(StaffPrincipal principal, String operation, String recordType, UUID recordId) {
        require(principal, operation + ":" + recordType + ":" + recordId);
    }
}
