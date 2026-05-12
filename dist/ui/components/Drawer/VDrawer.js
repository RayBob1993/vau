import { Drawer as e } from "../../../core/components/Drawer/index.js";
import { createBlock as t, createCommentVNode as n, createPropsRestProxy as r, createTextVNode as i, createVNode as a, defineComponent as o, mergeModels as s, mergeProps as c, openBlock as l, renderSlot as u, toDisplayString as d, unref as f, useModel as p, useSlots as m, withCtx as h } from "vue";
//#region src/lib/ui/components/Drawer/VDrawer.vue?vue&type=script&setup=true&lang.ts
var g = /* @__PURE__ */ o({
	__name: "VDrawer",
	props: /* @__PURE__ */ s({
		title: {},
		position: { default: "left" },
		appendToBody: {
			type: Boolean,
			default: !0
		},
		closeOnEscape: {
			type: Boolean,
			default: !0
		},
		size: {}
	}, {
		modelValue: {
			type: Boolean,
			required: !0
		},
		modelModifiers: {}
	}),
	emits: /* @__PURE__ */ s([
		"opened",
		"closed",
		"open",
		"close"
	], ["update:modelValue"]),
	setup(o, { emit: s }) {
		let g = r(o, [
			"title",
			"appendToBody",
			"position",
			"closeOnEscape"
		]), _ = s, v = m(), y = p(o, "modelValue");
		return (r, s) => (l(), t(f(e).Root, c({
			modelValue: y.value,
			"onUpdate:modelValue": s[0] ||= (e) => y.value = e
		}, g, {
			"append-to-body": o.appendToBody,
			"close-on-escape": o.closeOnEscape,
			position: o.position,
			onClose: s[1] ||= (e) => _("close"),
			onOpen: s[2] ||= (e) => _("open"),
			onOpened: s[3] ||= (e) => _("opened", e),
			onClosed: s[4] ||= (e) => _("closed", e)
		}), {
			default: h(({ close: s }) => [a(f(e).Dialog, null, {
				default: h(() => [a(f(e).Content, null, {
					default: h(() => [
						a(f(e).Header, null, {
							default: h(() => [u(r.$slots, "header", { close: s }, () => [o.title ? (l(), t(f(e).Title, { key: 0 }, {
								default: h(() => [i(d(o.title), 1)]),
								_: 1
							})) : n("", !0), a(f(e).Close)])]),
							_: 2
						}, 1024),
						a(f(e).Body, null, {
							default: h(() => [u(r.$slots, "default", { close: s })]),
							_: 2
						}, 1024),
						v?.footer ? (l(), t(f(e).Footer, { key: 0 }, {
							default: h(() => [u(r.$slots, "footer", { close: s })]),
							_: 2
						}, 1024)) : n("", !0)
					]),
					_: 2
				}, 1024)]),
				_: 2
			}, 1024)]),
			_: 3
		}, 16, [
			"modelValue",
			"append-to-body",
			"close-on-escape",
			"position"
		]));
	}
});
//#endregion
export { g as default };

//# sourceMappingURL=VDrawer.js.map