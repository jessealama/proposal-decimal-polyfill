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
    test("Decimal instances expose no own properties (internals are #private)", async () => {
        const { Decimal } = await import("proposal-decimal");
        const d = new Decimal("1.5");
        expect(Object.getOwnPropertyNames(d)).toEqual([]);
        expect(Object.getOwnPropertySymbols(d)).toEqual([]);
    });
});
