import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { knowledgeBaseService, Herb, AyurvedicRemedy } from '@/services/knowledgeBaseService';
import { Search, Leaf, FlaskConical, BookOpen, Sparkles } from 'lucide-react';

const KnowledgeBasePage = () => {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [remedies, setRemedies] = useState<AyurvedicRemedy[]>([]);
  const [filteredHerbs, setFilteredHerbs] = useState<Herb[]>([]);
  const [filteredRemedies, setFilteredRemedies] = useState<AyurvedicRemedy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [herbsData, remediesData] = await Promise.all([
        knowledgeBaseService.getHerbs(),
        knowledgeBaseService.getRemedies(),
      ]);
      setHerbs(herbsData);
      setRemedies(remediesData);
      setFilteredHerbs(herbsData);
      setFilteredRemedies(remediesData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filterData = async () => {
      if (!searchQuery) {
        setFilteredHerbs(herbs);
        setFilteredRemedies(remedies);
        return;
      }
      const results = await knowledgeBaseService.searchAll(searchQuery);
      setFilteredHerbs(results.herbs);
      setFilteredRemedies(results.remedies);
    };
    filterData();
  }, [searchQuery, herbs, remedies]);

  if (isLoading) return <LoadingPage />;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Ayurvedic Wisdom</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Knowledge Base
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore the ancient wisdom of Ayurveda. Discover medicinal herbs, natural remedies,
            and holistic treatments passed down through generations.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search herbs, remedies, conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="herbs" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="herbs" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Herbs ({filteredHerbs.length})
            </TabsTrigger>
            <TabsTrigger value="remedies" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Remedies ({filteredRemedies.length})
            </TabsTrigger>
          </TabsList>

          {/* Herbs Tab */}
          <TabsContent value="herbs">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHerbs.map((herb) => (
                <Card
                  key={herb.id}
                  className="border-border/50 shadow-card hover:shadow-elevated transition-all hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-herb/10 flex items-center justify-center mb-3">
                        <Leaf className="h-6 w-6 text-herb" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {herb.doshaEffect}
                      </Badge>
                    </div>
                    <CardTitle className="font-serif text-xl">{herb.name}</CardTitle>
                    <CardDescription className="italic text-sm">
                      {herb.sanskritName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{herb.description}</p>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-accent" />
                        Benefits
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {herb.benefits.slice(0, 3).map((benefit) => (
                          <Badge key={benefit} className="bg-herb/10 text-herb text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Common Uses</h4>
                      <div className="flex flex-wrap gap-1">
                        {herb.uses.slice(0, 3).map((use) => (
                          <Badge key={use} variant="secondary" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredRemedies.map((remedy) => (
                <Card
                  key={remedy.id}
                  className="border-border/50 shadow-card hover:shadow-elevated transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                        <FlaskConical className="h-6 w-6 text-accent" />
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {remedy.condition}
                      </Badge>
                    </div>
                    <CardTitle className="font-serif text-xl">{remedy.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Ingredients</h4>
                      <div className="flex flex-wrap gap-1">
                        {remedy.ingredients.map((ingredient) => (
                          <Badge key={ingredient} className="bg-herb/10 text-herb text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Preparation</h4>
                      <p className="text-sm text-muted-foreground">{remedy.preparation}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Dosage</p>
                        <p className="text-sm font-medium">{remedy.dosage}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Benefits:</span>{' '}
                        {remedy.benefits}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default KnowledgeBasePage;
