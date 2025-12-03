import * as assert from 'node:assert/strict';
import { isNotNull } from 'option-t/nullable';
/**
 *  @import { NotNull } from 'option-t/nullable'
 */

/**
 *  @param {unknown} value
 *  @returns    {asserts value is boolean}
 */
export function assertIsBoolean(value) {
    assert.strictEqual(typeof value, 'boolean', `value is not boolean`);
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is string}
 */
export function assertIsString(value) {
    assert.strictEqual(typeof value, 'string', `value is not string`);
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is number}
 */
export function assertIsNumber(value) {
    assert.strictEqual(typeof value, 'number', `value is not string`);
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is Function}
 */
export function assertIsFunction(value) {
    assert.strictEqual(typeof value, 'function', `value is not function`);
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is Array<unknown>}
 */
function assertIsArray(value) {
    assert.ok(Array.isArray(value), `value is not Array`);
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is Array<string>}
 */
export function assertIsStringArray(value) {
    assertIsArray(value);
    assert.ok(
        value.every((element) => typeof element === 'string'),
        'all elements are not string'
    );
}

/**
 *  @param {unknown} value
 *  @returns    {asserts value is NotNull<object>}
 */
export function assertIsNonNullObject(value) {
    assert.strictEqual(typeof value, 'object');
    assert.ok(isNotNull(value));
}
