import type { ProbeSample } from '../physics/types';
import type { Charge } from '../physics/types';

interface EMFormulaPanelProps {
  probe: ProbeSample | null;
  charges: Charge[];
}

export function EMFormulaPanel({ probe, charges }: EMFormulaPanelProps) {
  const hasMultiple = charges.length > 1;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
        Physics
      </h2>

      {/* Electric Field */}
      <FormulaCard
        title="Electric Field"
        color="text-yellow-400"
        borderColor="border-yellow-500/20"
        bgColor="bg-yellow-500/5"
        formula="E = k|q| / r²"
        description="Force per unit positive charge. Points away from + charges, toward − charges."
        detail={probe
          ? `|E| = ${probe.magnitude.toFixed(3)} N/C at the probe point`
          : 'Hover the canvas to measure E'}
      />

      {/* Electric Potential */}
      <FormulaCard
        title="Electric Potential"
        color="text-purple-400"
        borderColor="border-purple-500/20"
        bgColor="bg-purple-500/5"
        formula="V = kq / r"
        description="Work per unit charge to bring a test charge from infinity. Scalar — can be + or −."
        detail={probe
          ? `V = ${probe.V.toFixed(3)} V at the probe point`
          : 'Hover the canvas to measure V'}
      />

      {/* Gradient relationship */}
      <FormulaCard
        title="E = −∇V"
        color="text-teal-400"
        borderColor="border-teal-500/20"
        bgColor="bg-teal-500/5"
        formula="E⃗ = −∇V"
        description="The electric field is the negative gradient of potential. Field lines are always perpendicular to equipotential lines."
        detail="The colored field lines cross the dashed equipotential lines at 90°."
      />

      {/* Superposition */}
      {hasMultiple && (
        <FormulaCard
          title="Superposition"
          color="text-orange-400"
          borderColor="border-orange-500/20"
          bgColor="bg-orange-500/5"
          formula="E_total = ΣEᵢ, V_total = ΣVᵢ"
          description="For multiple charges, the total field and potential are the vector/scalar sums of individual contributions."
          detail={`${charges.length} charges active — superposition applied`}
        />
      )}

      {/* Constants */}
      <div className="bg-surface-800/40 rounded-xl border border-surface-700/40 p-3 space-y-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-surface-500 mb-2">Constants (normalized)</h3>
        <ConstRow label="k" value="1" note="Coulomb constant" />
        <ConstRow label="ε₀" value="1/4π" note="Permittivity of free space" />
        <ConstRow label="q range" value="[−5, +5]" note="Arbitrary units" />
      </div>
    </div>
  );
}

function FormulaCard({
  title, color, borderColor, bgColor, formula, description, detail,
}: {
  title: string; color: string; borderColor: string; bgColor: string;
  formula: string; description: string; detail: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-3 space-y-2`}>
      <h3 className={`text-xs font-bold ${color}`}>{title}</h3>
      <div className="font-mono text-sm text-white bg-surface-900/60 rounded-lg px-3 py-2">
        {formula}
      </div>
      <p className="text-xs text-surface-400 leading-relaxed">{description}</p>
      <p className={`text-[10px] font-mono ${color} opacity-75`}>{detail}</p>
    </div>
  );
}

function ConstRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-mono">
      <span className="text-surface-400">{label} = <span className="text-white">{value}</span></span>
      <span className="text-surface-600">{note}</span>
    </div>
  );
}
