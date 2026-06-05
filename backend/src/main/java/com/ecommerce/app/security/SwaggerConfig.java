package com.ecommerce.app.security;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cart-Forge API")
                        .description("""
                                Cart-Forge is a price-lock e-commerce platform.
                                
                                **How to authenticate:**
                                1. Use POST /api/auth/login with username and password
                                2. Copy the token from the response
                                3. Click the **Authorize** button (top right)
                                4. Enter: Bearer <your_token>
                                5. Click Authorize — now all protected APIs will work
                                
                                **Demo credentials:**
                                - Customer: customer1 / password
                                - Seller: seller1 / password
                                - Finance: finance1 / password
                                - Admin: admin1 / password
                                """)
                        .version("1.0.0")
                        .contact(new Contact().name("Cart-Forge Team")))
                .servers(List.of(new Server().url("http://localhost:8081").description("Local Dev Server")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from /api/auth/login")));
    }
}
