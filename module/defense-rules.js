export const whole=n=>Math.max(0,Math.trunc(Number(n)||0));
export function blockDamage(amount,power){const incoming=whole(amount),prevented=Math.min(incoming,whole(power));return {incoming,prevented,damage:incoming-prevented};}
export function parryOutcome(defenderHits,attackerHits,tp=0){const success=whole(attackerHits)>0&&whole(defenderHits)>whole(attackerHits);return {success,tp:Math.min(15,whole(tp)+(success?1:0))};}
