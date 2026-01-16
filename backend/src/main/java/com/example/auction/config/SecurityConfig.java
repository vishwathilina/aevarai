package com.example.auction.config;

import com.example.auction.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/auctions/live").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auctions/*").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/products/approved").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .requestMatchers("/api/reviewer/**").hasAnyRole("INSPECTOR", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("AUCTIONEER")
                        .requestMatchers(HttpMethod.GET, "/api/products/my").hasRole("AUCTIONEER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*/resubmit").hasRole("AUCTIONEER")
                        .requestMatchers(HttpMethod.POST, "/api/products/*/images").hasRole("AUCTIONEER")
                        .requestMatchers(HttpMethod.GET, "/api/products/*/images").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/bids/auction/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bids/highest/*").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/bids").hasAnyRole("USER", "BIDDER")
                        .requestMatchers(HttpMethod.GET, "/api/bids/my").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/bids/proxy").hasAnyRole("USER", "BIDDER")
                        .requestMatchers(HttpMethod.GET, "/api/bids/proxy/my").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/bids/proxy/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bids/proxy/*").authenticated()

                        .requestMatchers("/api/profile").authenticated()

                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
