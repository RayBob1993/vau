import { useConfigProviderRootContext as e } from "../ConfigProvider/context/useConfigProviderRootContext.js";
import { useEscapeKey as t } from "../../composables/useEscapeKey.js";
import { useBodyScrollbar as n } from "../../composables/useBodyScrollbar.js";
import { ModalRootContextKey as r } from "./context/key.js";
import { useModalRoot as i } from "./composables/useModalRoot.js";
import { Teleport as a, Transition as o, createBlock as s, createElementVNode as c, createVNode as l, defineComponent as u, mergeModels as d, mergeProps as f, openBlock as p, provide as m, renderSlot as h, unref as g, useAttrs as _, useModel as v, vShow as y, withCtx as b, withDirectives as x } from "vue";
//#region src/lib/core/components/Modal/ModalRoot.vue?vue&type=script&setup=true&lang.ts
var S = /* @__PURE__ */ u({
	inheritAttrs: !1,
	__name: "ModalRoot",
	props: /* @__PURE__ */ d({
		position: { default: "center" },
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
	emits: /* @__PURE__ */ d([
		"opened",
		"closed",
		"open",
		"close"
	], ["update:modelValue"]),
	setup(u, { emit: d }) {
		let S = u, C = d, w = v(u, "modelValue"), T = _(), E = e(), { show: D, hide: O } = n(), { close: k, teleportTarget: A } = i({
			configProviderRootContext: E,
			modelValue: w,
			props: S,
			onClose: () => {
				w.value = !1, D(), C("close");
			},
			onOpen: () => {
				O(), C("open");
			}
		});
		return t({
			when: () => w.value,
			enabled: () => S.closeOnEscape,
			onEscape: () => {
				k();
			}
		}), m(r, {
			props: S,
			close: k
		}), (e, t) => (p(), s(a, {
			to: g(A),
			disabled: !u.appendToBody
		}, [l(o, {
			name: "modal",
			onAfterEnter: t[1] ||= (e) => C("opened", e),
			onAfterLeave: t[2] ||= (e) => C("closed", e)
		}, {
			default: b(() => [x(c("div", f({ class: "modal" }, g(T), {
				class: {
					"modal--open": w.value,
					[`modal--position-${u.position}`]: u.position,
					[`modal--size-${u.size}`]: u.size
				},
				onClick: t[0] ||= (...e) => g(k) && g(k)(...e)
			}), [h(e.$slots, "default")], 16), [[y, w.value]])]),
			_: 3
		})], 8, ["to", "disabled"]));
	}
});
//#endregion
export { S as default };

//# sourceMappingURL=ModalRoot.js.map