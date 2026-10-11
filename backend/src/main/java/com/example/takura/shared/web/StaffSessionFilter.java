package com.example.takura.identity.infrastructure;

import com.example.takura.identity.application.StaffSessionService;
import com.example.takura.identity.domain.StaffPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class StaffSessionFilter extends OncePerRequestFilter {
    static final String PRINCIPAL_ATTRIBUTE = StaffPrincipal.class.getName();
    private final StaffSessionService sessions;
    public StaffSessionFilter(StaffSessionService sessions) { this.sessions = sessions; }
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/admin/")
                || ("POST".equals(request.getMethod()) && "/api/v1/admin/session".equals(request.getRequestURI()));
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String handle = request.getHeader("X-Staff-Session");
        if (!(authentication instanceof JwtAuthenticationToken token) || handle == null || handle.isBlank()) {
            response.sendError(401); return;
        }
        Jwt jwt = token.getToken();
        boolean interactive = !List.of("GET", "HEAD", "OPTIONS").contains(request.getMethod());
        try {
            StaffPrincipal principal = sessions.verify(handle, jwt.getIssuer().toString(), jwt.getSubject(),
                    jwt.getClaimAsString("client_id"), interactive);
            request.setAttribute(PRINCIPAL_ATTRIBUTE, principal);
            chain.doFilter(request, response);
        } catch (RuntimeException denied) { response.sendError(401); }
    }
}
