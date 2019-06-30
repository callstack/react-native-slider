it('finds text in example app', async () => {
  await expect(element(by.id('testTextId'))).toBeVisible();
});
