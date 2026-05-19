import { renderSlotFragments as e } from "../../utils/renderSlotFragments.js";
import { Comment as t, cloneVNode as n, defineComponent as r, mergeProps as i } from "vue";
//#region src/lib/core/components/Primitive/PrimitiveSlot.ts
var a = r({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(r, { attrs: a, slots: o }) {
		return () => {
			if (!o.default) return null;
			let r = e(o.default()), s = r.findIndex((e) => e.type !== t);
			if (s === -1) return r;
			let c = r[s];
			if (!c) return r;
			delete c.props?.ref;
			let l = c.props ? i(a, c.props) : a, u = n({
				...c,
				props: {}
			}, l);
			return r.length === 1 ? u : (r[s] = u, r);
		};
	}
});
//#endregion
export { a as Slot };

//# sourceMappingURL=PrimitiveSlot.js.map