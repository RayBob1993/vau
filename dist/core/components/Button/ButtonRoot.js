import { useButtonRoot as e } from "./composables/useButtonRoot.js";
import { useFormContext as t } from "../Form/context/useFormContext.js";
import { Primitive as n } from "../Primitive/index.js";
import { Spinner as r } from "../Spinner/index.js";
import { createBlock as i, createCommentVNode as a, defineComponent as o, normalizeClass as s, openBlock as c, renderSlot as l, unref as u, withCtx as d } from "vue";
//#region src/lib/core/components/Button/ButtonRoot.vue?vue&type=script&setup=true&lang.ts
var f = /* @__PURE__ */ o({
	__name: "ButtonRoot",
	props: {
		loading: { type: Boolean },
		disabled: { type: Boolean },
		plain: { type: Boolean },
		wide: { type: Boolean },
		rounded: { type: Boolean },
		square: { type: Boolean },
		type: { default: "button" },
		theme: {},
		size: {},
		sizeXs: {},
		sizeSm: {},
		sizeMd: {},
		sizeLg: {},
		sizeXl: {},
		sizeXxl: {},
		asChild: { type: Boolean },
		as: { default: "button" }
	},
	setup(o) {
		let f = o, { formRootContext: p, formItemContext: m } = t(), { isDisabled: h } = e({
			formRootContext: p,
			formItemContext: m,
			props: () => f
		});
		return (e, t) => (c(), i(u(n).Root, {
			as: o.as,
			"as-child": o.asChild,
			class: s(["button", [{
				"button--disabled": u(h),
				"button--loading": o.loading,
				"button--plain": o.plain,
				"button--wide": o.wide,
				"button--rounded": o.rounded,
				"button--square": o.square,
				[`button--theme-${o.theme}`]: o.theme,
				[`button--size-${o.size}`]: o.size,
				[`button--size-xs-${o.sizeXs}`]: o.sizeXs,
				[`button--size-sm-${o.sizeSm}`]: o.sizeSm,
				[`button--size-md-${o.sizeMd}`]: o.sizeMd,
				[`button--size-lg-${o.sizeLg}`]: o.sizeLg,
				[`button--size-xl-${o.sizeXl}`]: o.sizeXl,
				[`button--size-xxl-${o.sizeXxl}`]: o.sizeXxl
			}]]),
			tabindex: "0",
			disabled: u(h),
			type: o.type
		}, {
			default: d(() => [o.loading ? (c(), i(u(r).Root, {
				key: 0,
				size: o.size
			}, null, 8, ["size"])) : a("", !0), l(e.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"class",
			"disabled",
			"type"
		]));
	}
});
//#endregion
export { f as default };

//# sourceMappingURL=ButtonRoot.js.map