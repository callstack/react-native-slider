import {element, by} from 'detox';

it('finds text in example app', async () => {
  await expect(element(by.id('testTextId'))).toBeVisible();
});
