import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aikido Vocabulary App — Age & Content Rating',
  description:
    'Age suitability and content rating information for the Aikido Vocabulary App.',
};

export default function AikidoVocabularyContentRatingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Back to portfolio */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white rounded-full bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to portfolio</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Aikido Vocabulary App — Age &amp; Content Rating
        </h1>
        <p className="text-sm text-white/60 mb-8">
          This page explains the type of content included in the Aikido Vocabulary App so
          you can decide whether it is appropriate for you or your students.
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold mt-4">Overview</h2>
          <p>
            The Aikido Vocabulary App is a focused learning tool to help Aikido students
            learn Japanese terms used in the dojo. Future versions will include optional
            short training clips that demonstrate techniques and etiquette visually.
          </p>

          <h2 className="text-xl font-semibold mt-4">Violence &amp; Martial Arts</h2>
          <p>
            The app may include short Aikido training clips recorded in a dojo setting.
            These clips show:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Controlled throws and pins performed under supervision.</li>
            <li>Partners cooperating to demonstrate techniques safely.</li>
            <li>
              Weapons practice using <span className="font-semibold">wooden</span> training
              weapons such as jo (staff) and bokken (wooden sword).
            </li>
          </ul>
          <p>
            There is <span className="font-semibold">no blood</span>,{' '}
            <span className="font-semibold">no injuries</span>,{' '}
            <span className="font-semibold">no live blades</span>, and{' '}
            <span className="font-semibold">no fighting outside of instructional martial
            arts</span>. The focus is on controlled, respectful practice, not on
            aggression or violence.
          </p>

          <h2 className="text-xl font-semibold mt-4">Suggested Age Group</h2>
          <p>
            The app is primarily intended for <span className="font-semibold">teens and
            adults</span> who are practising Aikido or interested in Japanese martial arts
            vocabulary.
          </p>
          <p>
            It may be suitable for younger Aikido students when used with{' '}
            <span className="font-semibold">parental or instructor supervision</span>,
            similar to how you would supervise a child&apos;s participation in a regular
            dojo class.
          </p>

          <h2 className="text-xl font-semibold mt-4">Other Content</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>No gore, horror or shocking imagery.</li>
            <li>No sexual content or nudity.</li>
            <li>No gambling, drugs, alcohol or tobacco promotion.</li>
            <li>No user-generated public content or online chat.</li>
            <li>No in-app purchases or advertising.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Summary</h2>
          <p>
            The Aikido Vocabulary App is best described as an{' '}
            <span className="font-semibold">educational martial arts companion</span>, with
            non-graphic, instructional footage that reflects what you might see in a
            normal Aikido class. It is not a fighting game and does not glorify violence.
          </p>

          <h2 className="text-xl font-semibold mt-4">Questions</h2>
          <p>
            If you have any questions about the age suitability or content of the app,
            you can contact the developer:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}



