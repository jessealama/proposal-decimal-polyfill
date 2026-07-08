describe("package encapsulation", () => {
    test("the main entry point exposes Decimal", async () => {
        const mod = await import("proposal-decimal");
        expect(mod.Decimal).toBeDefined();
    });
    test.each(["CoefficientExponent", "Rounding"])(
        "internal module %s cannot be imported from the package",
        async (mod) => {
            await expect(
                import(`proposal-decimal/src/${mod}.mjs`)
            ).rejects.toMatchObject({
                code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
            });
        }
    );
});
