import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

const TarifeAsistani = ({ navigation, addFavorite }) => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipesFromCohere = async () => {
    if (!ingredients) {
      alert("Lütfen malzemelerinizi girin!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.cohere.ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer iPv8K39lodsfqoShALIU5H3mpYroz5WgSPD6UK83`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-xlarge-nightly',
          prompt: `Elimde şu malzemeler var: ${ingredients}. Bu malzemelerle yapabileceğim tarifleri aşağıda numaralandırarak sıralayın. Her tarifin adını ve detaylarını yazın. Örnek format: 1. Tarif Adı - Tarif Detayları.`,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error("API Hatası:", response.status, response.statusText);
        alert(`API Hatası: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.text) {
        const aiResponse = data.text.trim();

        const recipeList = aiResponse
          .split('\n')
          .filter((line) => line.trim() !== "")
          .slice(0, 10)
          .map((line, index) => {
            const [name, details] = line.split(':', 2);

            // Tarif adı temizleme: Eğer "tarif adı" gibi bir şey gelirse bunu düzeltiyoruz.
            const cleanName = name && name.trim() && name.trim() !== "tarif adı" ? name.trim() : `Tarif ${index + 1}`;
            const cleanDetails = details ? details.trim() : "Detay bulunamadı.";

            return {
              id: index.toString(),
              name: cleanName,
              details: cleanDetails,
            };
          });

        setRecipes(recipeList);
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/Zarzavat_Logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Tarif Asistanı</Text>

      <TextInput
        style={styles.input}
        placeholder="Malzemeleri girin (örn: yumurta, süt)"
        value={ingredients}
        onChangeText={setIngredients}
      />

      <TouchableOpacity style={styles.button} onPress={fetchRecipesFromCohere}>
        <Text style={styles.buttonText}>Tarif Ara</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#FF6F00" style={styles.loader} />}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Tarif Detay', { recipe: item })}
            >
              <Text style={styles.recipeName}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addFavorite(item)}
            >
              <Text style={styles.addButtonText}>Favorilere Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8E1',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FF6F00',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FF6F00',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFA040',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF6F00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  recipeCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFD180',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FFA040',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TarifeAsistani;
