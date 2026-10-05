package com.example.takura;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.example.takura", importOptions = com.tngtech.archunit.core.importer.ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    @ArchTest
    static final ArchRule modules_must_not_form_cycles = slices()
            .matching("com.example.takura.(*)..")
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule repositories_stay_inside_their_module = classes()
            .that().haveSimpleNameEndingWith("Repository")
            .should().onlyBeAccessed().byAnyPackage("..infrastructure..", "..application..", "..domain..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule controllers_do_not_expose_persistence_models = classes()
            .that().resideInAPackage("..controller..")
            .should().onlyDependOnClassesThat().resideOutsideOfPackage("..infrastructure.persistence..");

    @org.junit.jupiter.api.Test
    void forbidden_controller_dependency_is_detected() {
        JavaClasses fixture = new ClassFileImporter().importPackages("architecturefixture");
        ArchRule rule = classes().that().resideInAPackage("..controller..")
                .should().onlyDependOnClassesThat().resideOutsideOfPackage("..infrastructure.persistence..");
        org.junit.jupiter.api.Assertions.assertFalse(rule.evaluate(fixture).getFailureReport().isEmpty());
    }
}
