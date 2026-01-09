import { generateIllustration, svgToDataURL } from '../imageGeneration';

describe('SVG Image Generation', () => {
  describe('generateIllustration', () => {
    it('should generate valid SVG markup', () => {
      const svg = generateIllustration('The dog ran to the park');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 400 200"');
    });

    it('should detect and render animals', () => {
      const svg = generateIllustration('The happy dog played with the cat');

      expect(svg).toContain('<!-- Dog -->');
      expect(svg).toContain('<!-- Cat -->');
    });

    it('should detect and render weather conditions', () => {
      const rainySvg = generateIllustration('It was a rainy day');
      const snowySvg = generateIllustration('It was snowing outside');
      const sunnySvg = generateIllustration('The sun was shining');

      expect(rainySvg).toContain('708090'); // Slate gray for rain
      expect(snowySvg).toContain('B0C4DE'); // Light steel blue for snow
      expect(sunnySvg).toContain('FFFF00'); // Yellow sun
    });

    it('should detect and render vehicles', () => {
      const svg = generateIllustration('The car and bus drove down the street');

      expect(svg).toContain('<!-- Car -->');
      expect(svg).toContain('<!-- Bus -->');
    });

    it('should detect and render locations', () => {
      const schoolSvg = generateIllustration('We went to school');
      const parkSvg = generateIllustration('We played at the park');
      const beachSvg = generateIllustration('We went to the beach');

      expect(schoolSvg).toContain('A9A9A9'); // Gray ground for school
      expect(parkSvg).toContain('7CFC00'); // Bright green grass for park
      expect(beachSvg).toContain('F0E68C'); // Sandy beach
    });

    it('should detect and render emotions', () => {
      const happySvg = generateIllustration('The happy child smiled');
      const sadSvg = generateIllustration('The sad boy cried');

      // Both should contain character elements
      expect(happySvg).toContain('character');
      expect(sadSvg).toContain('character');
    });

    it('should handle sentences with multiple elements', () => {
      const svg = generateIllustration('The happy dog ran to the park on a rainy day');

      expect(svg).toContain('<!-- Dog -->');
      expect(svg).toContain('708090'); // Rainy weather
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should generate different illustrations for different animals', () => {
      const animals = ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'rabbit', 'bee', 'butterfly', 'duck'];

      animals.forEach(animal => {
        const svg = generateIllustration(`I saw a ${animal}`);
        expect(svg).toContain(`<!-- ${animal.charAt(0).toUpperCase() + animal.slice(1)} -->`);
      });
    });

    it('should generate different illustrations for different vehicles', () => {
      const vehicles = ['car', 'bus', 'bike', 'train', 'truck', 'boat'];

      vehicles.forEach(vehicle => {
        const svg = generateIllustration(`I rode in a ${vehicle}`);
        expect(svg).toContain(`<!-- ${vehicle.charAt(0).toUpperCase() + vehicle.slice(1)} -->`);
      });
    });

    it('should handle night weather', () => {
      const svg = generateIllustration('It was night time');

      expect(svg).toContain('191970'); // Midnight blue
      expect(svg).toContain('<!-- Moon -->');
      expect(svg).toContain('<!-- Stars -->');
    });

    it('should handle cloudy weather', () => {
      const svg = generateIllustration('It was cloudy outside');

      expect(svg).toContain('A9C5E0'); // Pale blue
      expect(svg).toContain('<!-- Clouds -->');
    });

    it('should render objects when detected', () => {
      const svg = generateIllustration('I played with the ball and read a book');

      // Should contain the sentence elements
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should always include background elements', () => {
      const svg = generateIllustration('Hello');

      expect(svg).toContain('<rect'); // Background rectangle
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should be case-insensitive when detecting elements', () => {
      const upperSvg = generateIllustration('The DOG ran');
      const lowerSvg = generateIllustration('the dog ran');
      const mixedSvg = generateIllustration('The Dog Ran');

      expect(upperSvg).toContain('<!-- Dog -->');
      expect(lowerSvg).toContain('<!-- Dog -->');
      expect(mixedSvg).toContain('<!-- Dog -->');
    });

    it('should generate valid SVG for empty or minimal sentences', () => {
      const svg = generateIllustration('I go');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox="0 0 400 200"');
    });
  });

  describe('svgToDataURL', () => {
    it('should convert SVG to data URL', () => {
      const svg = '<svg><rect /></svg>';
      const dataUrl = svgToDataURL(svg);

      expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
      expect(dataUrl).toContain('svg');
    });

    it('should properly encode special characters', () => {
      const svg = '<svg><text>Test & "quotes"</text></svg>';
      const dataUrl = svgToDataURL(svg);

      expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
      expect(dataUrl).not.toContain('&');
      expect(dataUrl).not.toContain('"');
    });

    it('should handle complex SVG markup', () => {
      const svg = generateIllustration('The happy dog ran to the park');
      const dataUrl = svgToDataURL(svg);

      expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
      expect(dataUrl.length).toBeGreaterThan(100);
    });
  });

  describe('Performance', () => {
    it('should generate illustrations quickly', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        generateIllustration('The happy dog ran to the park on a rainy day');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should generate 100 illustrations in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Robustness', () => {
    it('should handle null input gracefully', () => {
      expect(() => generateIllustration(null)).not.toThrow();
    });

    it('should handle undefined input gracefully', () => {
      expect(() => generateIllustration(undefined)).not.toThrow();
    });

    it('should handle empty string input', () => {
      const svg = generateIllustration('');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should handle very long sentences', () => {
      const longSentence = 'The dog and cat and bird and fish and horse and cow and pig and chicken went to the school and park and beach on a rainy snowy cloudy day';
      const svg = generateIllustration(longSentence);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should handle special characters in sentences', () => {
      const svg = generateIllustration('The dog\'s ball! "Wow," she said. <Amazing>');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
