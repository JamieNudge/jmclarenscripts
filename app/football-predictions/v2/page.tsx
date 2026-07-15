import { redirect } from 'next/navigation';

/** Preview path retired after cutover. */
export default function GoalLabV2PreviewRedirect() {
  redirect('/football-predictions');
}
