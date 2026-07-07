describe("package encapsulation", () => {
    test("the main entry point exposes Decimal", async () => {
        const mod = await import("proposal-decimal");
        expect(mod.Decimal).toBeDefined();
    });
    test("internal modules cannot be imported from the package", async () => {
        await expect(
            import("proposal-decimal/src/CoefficientExponent.mjs")
        ).rejects.toThrow(/not defined by "exports"/);
    });
});
