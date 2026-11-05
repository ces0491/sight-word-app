import React from 'react';
import { splitBySightWords } from '../../lib/sightWords';

/** Element used to mark a sight word in each display format. */
const MATCH_ELEMENTS = {
  highlighted: { Tag: 'span', className: 'highlight' },
  bold: { Tag: 'strong' },
  underlined: { Tag: 'u' },
};

/**
 * Render one story sentence with its sight words marked up.
 *
 * Text is rendered as React children, so story content is always escaped,
 * whether it came from the scene generator, the AI route or the database.
 *
 * @param {object} props
 * @param {string} props.sentence
 * @param {string[]} props.words - Sight words to mark
 * @param {'highlighted'|'bold'|'underlined'|'normal'} props.format
 */
const StoryText = ({ sentence, words, format }) => {
  const match = MATCH_ELEMENTS[format];
  if (!match) return <>{sentence}</>;

  const { Tag, className } = match;
  return (
    <span className="highlighted-text">
      {splitBySightWords(sentence, words).map((segment, index) =>
        segment.isMatch ? (
          <Tag key={index} className={className}>
            {segment.text}
          </Tag>
        ) : (
          <React.Fragment key={index}>{segment.text}</React.Fragment>
        )
      )}
    </span>
  );
};

export default StoryText;
